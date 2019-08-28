package io.temperate.api.services

import java.time.Duration
import java.util.function.BiConsumer

import cats.effect._
import io.circe.syntax._
import io.temperate.api.Config
import org.http4s._
import org.http4s.circe._
import org.http4s.dsl.io._
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider
import software.amazon.awssdk.http.nio.netty.NettyNioAsyncHttpClient
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3AsyncClient
import software.amazon.awssdk.services.s3.model.{HeadObjectRequest, HeadObjectResponse}

object HealthcheckService {

  val S3Timeout = 5

  val S3Bucket: String = Config.healthcheckBucket

  // The specific file checked is mostly arbitrary, we just want to ensure we can access *a* file
  val S3Path: String = Config.healthcheckKeyPath

  private def checkS3(implicit timer: Timer[IO], contextShift: ContextShift[IO]): IO[Boolean] = {
    var s3clientBuilder = S3AsyncClient
      .builder()
      .httpClient(
        NettyNioAsyncHttpClient.builder().readTimeout(Duration.ofSeconds(S3Timeout)).build())
      .region(Region.of(Config.awsRegion))

    // In production we'll authenticate via IAM roles and don't need to provide the AWS profile
    if (sys.env.contains("AWS_PROFILE")) {
      s3clientBuilder = s3clientBuilder
        .credentialsProvider(
          ProfileCredentialsProvider
            .builder()
            .profileName(Config.awsProfile)
            .build()
        )
    }
    val s3client = s3clientBuilder.build()

    val request = HeadObjectRequest
      .builder()
      .bucket(S3Bucket)
      .key(S3Path)
      .build()

    IO.async[Boolean] { cb =>
      s3client
        .headObject(request)
        .whenComplete(new BiConsumer[HeadObjectResponse, Throwable] {
          override def accept(t: HeadObjectResponse, u: Throwable): Unit = {
            if (t != null) {
              cb(Right(true))
            } else {
              cb(Right(false))
            }
          }
        })
    }
  }

  def routes(implicit timer: Timer[IO], contextShift: ContextShift[IO]): HttpRoutes[IO] =
    HttpRoutes.of[IO] {
      case GET -> Root =>
        for {
          s3result <- checkS3
          response = Map("s3" -> s3result).asJson
          resp <- if (s3result) {
            Ok(response)
          } else {
            ServiceUnavailable(response)
          }
        } yield resp
    }
}
